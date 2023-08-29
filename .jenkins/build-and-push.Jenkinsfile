String APP_NAME = 'jira-sync'
String IMAGE_REPO = 'jira-sync-docker/'
String REPOSITORY = 'pmedianetwork/jira-sync'
String DOCKERFILE = 'Dockerfile'

pipeline {
    agent none
    libraries { lib 'adverity-shared-library@master' }
    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '60', artifactNumToKeepStr: '1'))
    }
    environment {
        GITHUB_CREDS = credentials('adverity-github-credentials')
        GITHUB_TOKEN = "${env.GITHUB_CREDS_PSW}"
        ARTIFACTORY_CREDS = credentials('jcasc-artifactory-ci-internal')
    }
    stages {
        stage('Build and Push') {
            agent { label 'worker' }
            steps {
                retry(3) {
                    script {
                        def head = shout("git rev-parse HEAD")
                        def prId =  env.CHANGE_ID ?: shout("git ls-remote origin \"pull/*/head\" | grep -F ${head} | cut -d\"/\" -f3")
                        def imageName = generateImageTag(appName: APP_NAME, targetRepo: IMAGE_REPO, source: REF, changeId: prId)
                        withCommitStatus(
                            repository: REPOSITORY,
                            commitish: head,
                            context: imageName,
                            targetUrl: env.RUN_DISPLAY_URL
                        ) {
                            def image = docker.build(
                                imageName, "--build-arg BUILDKIT_INLINE_CACHE=1 \
                                --cache-from ${imageName} --rm \
                                -f ${DOCKERFILE} ."
                            )
                            image.push()
                            try {
                                sh "docker rmi ${imageName}"
                            } catch (Exception e) {
                                echo 'Exception occurred: ' + e.toString()
                            }
                        }
                    }    
                }
            }
            post{
                cleanup {
                    cleanWs()
                }
                failure {
                    notifySlack channel: 'dev-deployments-failures'
                }
            }
        }
    }
}
