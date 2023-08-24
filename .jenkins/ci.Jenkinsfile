String REPOSITORY = 'pmedianetwork/jira-sync'
String DOCKERFILE = 'Dockerfile'

pipeline {
    libraries { lib "adverity-shared-library@master" }
    agent { label 'worker' }
    options {
        timeout(time: 60, unit: 'MINUTES')
    }
    environment {
        GITHUB_CREDS = credentials('adverity-github-credentials')
        GITHUB_TOKEN = "${env.GITHUB_CREDS_PSW}"
        SHA = "${sh(script: "git rev-parse HEAD", returnStdout: true).trim()}"
    }
    stages {
        stage('Test') {
            when { 
                allOf {
                    changeRequest()
                }
            }
            stages {
                stage('Build Image') {
                    steps {
                        withCommitStatus(
                            repository: REPOSITORY,
                            commitish: SHA,
                            context: 'tests/build-jira-sync-image',
                            targetUrl: "${env.RUN_DISPLAY_URL}"
                            ) {
                            script {
                                docker.build(
                                    "testimage:latest", "--build-arg BUILDKIT_INLINE_CACHE=1 \
                                    --cache-from adverity.jfrog.io/reveal-docker/jira-sync:develop --rm \
                                    -f ${DOCKERFILE} ."
                                )    
                            }
                        }
                    }
                }
            }
        }
    }
    post {
        cleanup {
            cleanWs()
        }
    }
}