variable "aws_region" {
  description = "AWS region to deploy resource"
  type        = string
  default     = "af-south-1"
}

variable "project_name" {
  description = "Project Name used for resource naming and tagging"
  type        = string
  default     = "payflow"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocs for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for pivate subnet"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "payflow"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "payflow_user"
}

variable "db_password" {
  description = "PostgresSQL master password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}
