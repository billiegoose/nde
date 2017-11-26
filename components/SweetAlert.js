import style from 'sweetalert2/dist/sweetalert2.min.css'
import swal from 'sweetalert2'

export async function prompt (text) {
  if (typeof text === 'string') {
    return swal({
      text,
      input: 'text',
      useRejections: true
    })
  } else if (typeof text === 'object') {
    if (text.input === undefined) {
      text.input = 'text'
    }
    text.useRejections = true
    return swal(text)
  }
}
