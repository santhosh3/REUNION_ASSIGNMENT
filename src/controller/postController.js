const postModel = require("../model/postModel");
const commentModel = require("../model/commentModel")
const {isValid,isValidObjectId} = require("../validator/validator");
const mongoose = require('mongoose')

const posts = async function(req,res){
   try {
    let body = req.body;
    if(Object.keys(body).length == 0){
       return res.status(400).send({status:false,message:"please provide data to post"})
    }
    if(body.isDeleted == true){
      return res.status(400).send({status:false,message:"Bad request"})
    }
    let {Title,Description} = body
    if(!isValid(Title)){
        return res.status(400).send({status:false,message:"Title should be present"})
    }
    if(!isValid(Description)){
        return res.status(400).send({status:false,message:"Description should be present"})
    }
    body.user = req.userId
    let create = await postModel.create(body);
    let data = {
        postId: create._id,
        Title: create.Title,
        Description: create.Description,
        Time: create.Time.toLocaleString()
    }
    return res.status(201).send({status:true, message:"post created successfully", data:data})
   } catch (error) {
    return res.status(500).send({status:false, message:error.message})
   }
}

const deletePost = async function(req,res){
  try {
  let postId = req.params.Id;
  let post = await postModel.findById(postId);
  if(!isValidObjectId(postId)){
    return res.status(400).send({status:false,message:"please enter valid postId"})
  }
  if(!post){
    return res.status(400).send({status:false,message:"postId is not found"})
  }
  if(post.user != req.userId){
    return res.status(400).send({status:false,message:"You are not authorised to delete that post"})
  }
  if(post.isDeleted == true){
    return res.status(400).send({status:false,message:"This post is already deleted"})
  }
  await postModel.findOneAndUpdate({_id:postId},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true})
  return res.status(200).send({status:false,message:"post deleted successfully"})
  } catch (error) {
  return res.status(500).send({status:false, message:error.message})
  }
}

const like = async function(req,res){
 try {
 let post = req.params.Id
 let findPost = await postModel.findOne({_id:post, isDeleted:false});
 if(!isValidObjectId(post)){
    return res.status(400).send({status:false,message:"please enter valid postId"})
  }
 if(!findPost){
    return res.status(400).send({status:false, message:"postId is not found"})
 }
 if(findPost.like.includes(req.userId)){
    return res.status(400).send({status:false,message:"you already liked the post"})
 }
 if(findPost.unlike.includes(req.userId)){
    await postModel.findOneAndUpdate({_id:post},{$pull:{unlike:req.userId}},{new:true});
 }
 await postModel.findOneAndUpdate({_id:post},{$push:{like:req.userId}},{new:true});
 return res.status(201).send({status:true,message:"successfully you liked the post"})
 } catch (error) {
 return res.status(500).send({status:false, message:error.message})
 }
}

const unlike = async function(req,res){
    try {
    let post = req.params.Id
    let findPost = await postModel.findOne({_id:post, isDeleted:false});
    if(!isValidObjectId(post)){
        return res.status(400).send({status:false,message:"please enter valid postId"})
    }
    if(!findPost){
        return res.status(400).send({status:false, message:"postId is not found"})
    }
    if(findPost.unlike.includes(req.userId)){
        return res.status(400).send({status:false, message:"you already unliked the post"})
    }
    if(findPost.like.includes(req.userId)){
        await postModel.findOneAndUpdate({_id:post},{$pull:{like:req.userId}},{new:true});
    }
    await postModel.findOneAndUpdate({_id:post},{$push:{unlike:req.userId}},{new:true});
    return res.status(200).send({status:true,message:"successfully you unliked the post"})
    } catch (error) {
    return res.status(500).send({status:false, message:error.message})
    }
}

const getPostDetails = async function(req,res){
 try{
  let postId = req.params.Id
  let find = await postModel.findOne({_id:postId,isDeleted:false});
  if(!find){
    return res.status(400).send({status:false,message:"post is not found"})
  }
  if(find.isDeleted == true){
    return res.status(400).send({status:false,message:"This post is deleted"})
  }

  let comment = await commentModel.find({postId:postId}).select('comment');
  let Obj = {
      postId : postId,
      userId : find.user,
      Title : find.Title,
      Description : find.Description,
      likes : find.like.length,
      comments : comment
  }
  return res.status(400).send({status:true,message:"getting all post details",data:Obj})
 } catch(error){
  return res.status(500).send({status:false, message:error.message})
 }
}

const getAllPosts = async function(req,res){
   let posts = await postModel.find({user:req.userId,isDeleted:false}).sort({time:1})
   let array = []
   for(let i = 0; i < posts.length; i++){
    let Obj = {
      postId : posts[i]._id,
      Title : posts[i].Title,
      Description : posts[i].Description,
      createdAt : posts[i].createdAt.toLocaleString(),
      comments : await commentModel.find({postId:posts[i]}).select('comment'),
      likes : posts[i].like.length,
     }
     array.push(Obj)
   }
   return res.status(200).send({status:true, data:array})
}

module.exports = {posts,deletePost,like,unlike,getPostDetails,getAllPosts}