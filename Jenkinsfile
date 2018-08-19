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
      notification()
    }
  }
}

def notification() {
  def slack_color = "good"
  def detail_link = "(<${env.BUILD_URL}|Open>)"

  def build_result = currentBuild.result
  if (build_result == null) {
    build_result = 'SKIPPED'
  }
  
  if (build_result == "FAILURE") {
    slack_color = "danger"
  } else if (build_result == "SKIPPED") {
    slack_color = "#0042B2"
  }

  def slack_msg = "[${build_result}] #${env.BUILD_NUMBER} ${env.JOB_NAME.replace('%2F', '/')} was built ${build_result} in ${currentBuild.durationString.replace(' and counting', '')}. ${detail_link}"
  slackSend color: "${slack_color}", message: "${slack_msg}"
}