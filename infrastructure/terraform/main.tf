# ======================================
# TERRAFORM CONFIGURATION
# ======================================
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# =====================================
# PROVIDER
# =====================================
provider "aws" {
  region = var.aws_region
}

# =====================================
# DATA SOURCE
# Get available avaailability zone in af-south-1 
# =====================================
data "aws_availability_zones" "available" {
  state = "available"
}

# ====================================
# VPC 
# The network boundary for all Payflow resourced
# ====================================
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}- vpc"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ====================================
# INTERNET GATEWAY 
# Allows public subnet to reach the internet
# ====================================
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-${var.environment}- igw"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ====================================
# PUBLIC SUBNET
# Two subnets across two availability zones
# RDS needs subnets in at least 2 AZs
# ====================================
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
    Type        = "public"
  }
}

# ====================================
# PRIVATE SUBNETS
# RDS lives here, no direct internet access
# ====================================
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-${count.index + 1}"
    Project     = var.project_name
    Environment = var.environment
    Type        = "private"
  }
}

# ===================================
# ROUTE TABLE 
# Routes traffic from public subnet to IGW
# ===================================
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-rt"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
# =============================================
# SECURITY GROUP - API 
# Controls what traffic reached the API
# =============================================
resource "aws_security_group" "api" {
  name        = "${var.project_name}-${var.environment}-api-sg"
  description = "Security group for Payflow API"
  vpc_id      = aws_vpc.main.id

  # Allow inbound HTTP on port 3000 
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Payflow API port"
  }

  #Allow inbound SSH for debugging
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # Allow all outbound traffic 
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ======================================
# SECURITY GROUP - RDS
# Only accepts connecting from api security
# This is least priviledge netwrokin
# ======================================
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for PAyflow RDS"
  vpc_id      = aws_vpc.main.id

  # Only allow PostgreSQL traffic from the api security group 
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
    description     = "PostgreSQL from API only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbund"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ===========================================
# RDS SUBNET GROUP 
# TELLS RDS WHICH DUBNET IT CAN USE 
# Must span at least 2 availability zone
# ===========================================
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "${var.project_name}-${var.environment}-db=subnet-group"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ===========================================
# RDS POSTGRESQL INSTANCE 
# The production database for Payflow
# db.t3.micro = ~0.018/hour =destroy when done
# ===========================================
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  # Engine
  engine         = "postgres"
  engine_version = "15"
  instance_class = var.db_instance_class

  # Storage
  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp2"
  storage_encrypted     = true

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network 
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup - minimal for dev 
  backup_retention_period = 0
  skip_final_snapshot     = true
  deletion_protection     = false


  tags = {
    Name        = "${var.project_name}-${var.environment}-db"
    Project     = var.project_name
    Environment = var.environment
  }
}

# =====================================
# ECR REPOSITORY 
# Stores the Docker image for Deployemnt
# =====================================
resource "aws_ecr_repository" "api" {
  name                 = "${var.project_name}-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.project_name}-api"
    Project     = var.project_name
    Environment = var.environment
  }
}

# ECR lifecycle policy - keep only last 10 images
resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
