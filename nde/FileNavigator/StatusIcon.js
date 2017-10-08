import Octicon from 'react-octicons-modular'
const mediumYellow = '#ee9e2e'
const mediumGreen = '#90a959'
const mediumRed = '#ac4142'
const mediumBlue = '#6a9fb5'
export default function StatusIcon ({status}) {
    switch (status) {
      case '*absent': return <Octicon name="diff-modified" style={{float: 'right', color: mediumYellow}}/>
      case '*unmodified': return <Octicon name="diff-modified" style={{float: 'right', color: mediumYellow}}/>
      case '*added': return <Octicon name="diff-added" style={{float: 'right', color: mediumYellow}}/>
      case '*modified': return <Octicon name="diff-modified" style={{float: 'right', color: mediumYellow}}/>
      case '*deleted': return <Octicon name="diff-removed" style={{float: 'right', color: mediumYellow}}/>
      case 'added': return <Octicon name="diff-added" style={{float: 'right', color: mediumGreen}}/>
      case 'modified': return <Octicon name="diff-modified" style={{float: 'right', color: mediumBlue}}/>
      case 'deleted': return <Octicon name="diff-removed" style={{float: 'right', color: mediumRed}}/>
      case 'unmodified': return <i></i>
      case 'absent': return <i></i>
      default: console.log(status)
    }
}