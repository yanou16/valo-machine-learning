# 1. On dit à Terraform d'utiliser AWS
provider "aws" {
  region = "us-east-1" # N. Virginia
}

# 2. On crée le "Pare-feu" (Security Group)
# Cela remplace l'étape manuelle "Ouvrir les ports"
resource "aws_security_group" "valoml_sg" {
  name        = "valoml-security-group"
  description = "Autoriser le trafic pour ValoML"

  # Autoriser SSH (pour te connecter)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Autoriser Frontend (3000)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Autoriser Backend API (8000)
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Autoriser Grafana (3001) - Optionnel
  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Autoriser tout le monde à sortir (Internet)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. On crée le Serveur (Instance EC2)
resource "aws_instance" "valoml_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS à us-east-1
  instance_type = "t3.small"              # Un peu de puissance pour ton ML
  key_name      = "valoml-key"            # Clé SSH pour se connecter
  
  vpc_security_group_ids = [aws_security_group.valoml_sg.id]

  # Script de démarrage automatique (User Data)
  # Ça installe Docker tout seul au démarrage ! 🚀
  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install docker.io docker-compose -y
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "ValoML-Production-Terraform"
  }
}

# 4. On affiche l'IP publique à la fin
output "server_ip" {
  value = aws_instance.valoml_server.public_ip
}