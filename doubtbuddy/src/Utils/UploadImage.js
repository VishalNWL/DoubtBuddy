import SummaryAPi from "../Common/SummaryApi"
import Axios from "../Utils/Axios"

const UploadImage = async (image)=>{
  try {
    const formData = new FormData()
    formData.append('image',image)
     const response = await Axios({
        ...SummaryAPi.uploadfile,
        data:formData
     })


     return response.data.data

  } catch (error) {
    return error
  }
}

export default UploadImage