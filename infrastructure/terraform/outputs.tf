output "vpc_id" {
  description = "ID of the Payflow VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "api_security_group_id" {
  description = "ID of the API security group"
  value       = aws_security_group.api.id
}

output "rds_endpoint" {
  description = "RDS instance endpoint - use this as DB_HOST in production"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "aws_ecr_repository_url" {
  description = "ECR repository URL - use this to push Docker images"
  value       = aws_ecr_repository.api.repository_url
}

output "aws_ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.api.name
}
