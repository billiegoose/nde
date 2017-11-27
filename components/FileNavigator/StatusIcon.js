import Octicon from 'react-octicons-modular'
const mediumYellow = '#ee9e2e'
const mediumGreen = '#90a959'
const mediumRed = '#ac4142'
const mediumBlue = '#6a9fb5'
export default function StatusIcon ({status}) {
  switch (status) {
    case '*absent': return <Octicon name="diff-modified" style={{position: 'absolute', top: 0, right: 0, color: mediumYellow}}/>
    case '*unmodified': return <Octicon name="diff-modified" style={{position: 'absolute', top: 0, right: 0, color: mediumYellow}}/>
    case '*added': return <Octicon name="diff-added" style={{position: 'absolute', top: 0, right: 0, color: mediumYellow}}/>
    case '*modified': return <Octicon name="diff-modified" style={{position: 'absolute', top: 0, right: 0, color: mediumYellow}}/>
    case '*deleted': return <Octicon name="diff-removed" style={{position: 'absolute', top: 0, right: 0, color: mediumYellow}}/>
    case 'added': return <Octicon name="diff-added" style={{position: 'absolute', top: 0, right: 0, color: mediumGreen}}/>
    case 'modified': return <Octicon name="diff-modified" style={{position: 'absolute', top: 0, right: 0, color: mediumBlue}}/>
    case 'deleted': return <Octicon name="diff-removed" style={{position: 'absolute', top: 0, right: 0, color: mediumRed}}/>
    case '*undeleted': return <Octicon name="diff-removed" style={{position: 'absolute', top: 0, right: 0, color: mediumRed}}/>
    case '*undeletemodified': return <Octicon name="diff-removed" style={{position: 'absolute', top: 0, right: 0, color: mediumRed}}/>
    case 'unmodified': return <i></i>
    case 'absent': return <i></i>
    default: console.log(status)
  }
}
