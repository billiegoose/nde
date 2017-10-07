export default function StatusIcon ({status}) {
    switch (status) {
      case '*absent': return <i className="fa fa-circle" style={{color: 'blue'}}></i>
      case '*unmodified': return <i className="fa fa-circle" style={{color: 'blue'}}></i>
      case '*added': return <i className="fa fa-question-circle" style={{color: 'black'}}></i>
      case '*modified': return <i className="fa fa-circle-o" style={{color: 'blue'}}></i>
      case '*deleted': return <i className="fa fa-minus-circle" style={{color: 'black'}}></i>
      case 'added': return <i className="fa fa-plus-circle" style={{color: 'green'}}></i>
      case 'modified': return <i className="fa fa-circle" style={{color: 'blue'}}></i>
      case 'deleted': return <i className="fa fa-minus-circle" style={{color: 'red'}}></i>
      case 'unmodified': return <i></i>
      case 'absent': return <i></i>
      default: console.log(status)
    }
}