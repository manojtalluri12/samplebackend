const jwt= require('jsonwebtoken')

module.exports=function(req,res,next){
    try {
        let token=req.header('x-token')
        if(!token){
            return next(errorHandler(400, "token not found"));
        }
        let decode=jwt.verify(token,'jwt')
        req.user=decode.user
       next()
    } catch (error) {
        //console.log(error);
        next(errorHandler(500, "invalid token"));
    }

}

const errorHandler = (statusCode, message) => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    return error;
  };
  