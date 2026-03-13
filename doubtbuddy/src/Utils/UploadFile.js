import SummaryAPi from "../Common/SummaryApi"
import Axios from "../Utils/Axios"

const UploadFile = async (file, data) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('class', data.class)
    formData.append('batch', data.batch)
    formData.append('type', data.type)
    if (data.studentId) formData.append('studentId', data.studentId)

    const response = await Axios({
      ...SummaryAPi.uploadFile,
      data: formData
    })

    return response.data.data
  } catch (error) {
    return error
  }
}

export default UploadFile