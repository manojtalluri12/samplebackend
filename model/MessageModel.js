const mongoose=require('mongoose')
const message=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Reg'
    },
    username:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        default:Date.now()
    }
})
module.exports=mongoose.model("message",message)