pipeline {
    agent any

    environment {
        EC2_USER = 'ubuntu'
        EC2_HOST = '65.0.45.25'
        EC2_KEY = credentials('ec2-ssh-key')
        IMAGE_NAME = 'react-app'
        CONTAINER_NAME = 'react-container'
    }

    stages {
        stage('Checkout Code') {
            steps {
                cleanWs()
                git branch: 'main', url: 'https://github.com/lijojose43/cook-easy.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh 'docker build -t ${IMAGE_NAME}:latest .'
                }
            }
        }

        stage('Push Image to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                        scp -o StrictHostKeyChecking=no docker-compose.yml ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                        scp -o StrictHostKeyChecking=no Dockerfile ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                        scp -r -o StrictHostKeyChecking=no build ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                    '''
                }
            }
        }

        stage('Deploy on EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            docker stop ${CONTAINER_NAME} || true &&
                            docker rm ${CONTAINER_NAME} || true &&
                            docker rmi ${IMAGE_NAME}:latest || true &&
                            docker build -t ${IMAGE_NAME}:latest . &&
                            docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest
                        '
                    '''
                }
            }
        }
    }
}
