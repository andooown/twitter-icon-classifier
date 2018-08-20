pipeline {
  agent any
  
  stages {
    stage('deploy') {
      when { branch 'master' }
      steps {
        script {
          try {
            sh './deploy.sh'	
            currentBuild.result = "SUCCESS"	
          } catch (e) {	
            currentBuild.result = "FAILURE"          	
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (currentBuild.result != null) {
          notification()
        }
      }
    }
  }
}

def notification() {
  def slack_color = "good"
  def detail_link = "(<${env.BUILD_URL}|Open>)"

  if (currentBuild.result == "FAILURE") {
    slack_color = "danger"
  }

  def slack_msg = "[${currentBuild.result}] #${env.BUILD_NUMBER} ${env.JOB_NAME.replace('%2F', '/')} was built ${currentBuild.result} in ${currentBuild.durationString.replace(' and counting', '')}. ${detail_link}"
  slackSend color: "${slack_color}", message: "${slack_msg}"
}