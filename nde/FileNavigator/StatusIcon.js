export default function StatusIcon ({status}) {
    switch (status) {
        case 'added': return <i className="fa fa-plus-circle" style={{color: 'green'}}></i>
        case 'deleted': return <i className="fa fa-minus-circle" style={{color: 'red'}}></i>
        case 'untracked': return <i className="fa fa-question-circle" style={{color: 'black'}}></i>
        case 'changed': return <i className="fa fa-circle"></i>
    }
}