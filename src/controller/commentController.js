const commentModel = require("../model/commentModel");
const postModel = require("../model/postModel");
const {isValid,isValidObjectId} = require("../validator/validator");
const mongoose = require('mongoose')

const commentCreate = async function(req,res){
 try {
    let post = req.params.Id
    let find = await postModel.findOne({postId:post, isDeleted:false});
    if(!find){
      return res.status(400).send({status:false,message:"postId is not found"})
    }
    let body = req.body
    let {comment} = body
    if(!isValid(comment)){
      return res.status(400).send({status:false,message:"plase provide comment"})
    }
    body.postId = post;
    body.user = req.userId;
    let create = await commentModel.create(body);
    let commentObj = {
        commentId : create._id,
        comment : create.comment
    }
    return res.status(201).send({status:true,message:"comment created successfully",data:commentObj})
 } catch (error) {
    return res.status(500).send({status:false, message:error.message})
 }
}



module.exports = {commentCreate}