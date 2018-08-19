pipeline {
  agent any
  stages {
    stage('deploy') {
      when { branch 'master' }
      steps {
        sh './deploy.sh'
      }
    }
  }
}