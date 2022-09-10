const userModel = require("../model/userModel")
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const {isValid,isValidString} = require("../validator/validator");

const register = async function(req,res){
    try {
        let body = req.body;
    let {userName, email, password} = body;
    if(Object.keys(body).length == 0){
       return res.status(400).send({status:false, message:"please provide data to register"})
    }
    let array = [userName, email, password]
    for(let i = 0; i < array.length-1; i++){
        if(!isValid(array[i])) return res.status(400).send({status:false, message:"Mandatory field is missing"});
    }
    let emailExist = await userModel.findOne({email:email})
    if(emailExist){
        return res.status(409).send({status: false, message:"EmailId is already exist"})
    }
    let create = await userModel.create(body)
    let registerData = {
        userName : create.userName,
        email : create.email,
        password : create.password
    }
    return res.status(201).send({status:true, message:"user creates successfully", data:registerData})
    } catch (error) {
    return res.status(500).send({status:false,message:error.message})
    }
}

const login = async function(req,res){
 try {
    let body = req.body
    if (Object.keys(body).length == 0) {
        return res.status(400).send({ status: false, message: "Please provide login details" })
    }
    let { email, password } = body
    if(!isValid(email)) {
        return res.status(400).send({status:false, message: "Email is required"})
    }
    if(!isValid(password)) {
        return res.status(400).send({status:false, message: "password is required"})
    }
    let data = await userModel.findOne({ email: email, password: password })
    if (!data) {
        return res.status(400).send({ status: false, message: "Invalid login credentials" })
    }
    else {
        let token = jwt.sign({ 
                userId: data._id,
                iat: Math.floor(Date.now()/1000),
                iat: Math.floor(Date.now()/1000)+60*60*60}, "REUNION")
                
        return res.status(200).send({ status: true, message: "User login successful", data: {token} })
    }
 } catch (error) {
   return res.status(500).send({status:false,message:error.message})
 }
}

const follow = async function(req,res){
  try {
      let userId = req.params.Id;
      let findData = await userModel.findById(userId);
      let user = await userModel.findById(req.userId);
      if (!findData) {
         return res.status(404).send({ status: false, message: "No user Found" });
      }  
      let follower = findData.followers.includes(req.userId)
      if(follower){
        return res.status(400).send({status:false,message:`you already following ${findData.userName}`})
      }
      else {
        await userModel.findOneAndUpdate({_id:userId},{$push:{followers:req.userId}},{new:true})
        await userModel.findOneAndUpdate({_id:req.userId},{$push:{following:userId}},{new:true})
      }
      return res.status(200).send({status:true, message:`Now you are following ${findData.userName}`})

  } catch (error) {
    return res.status(500).send({status:false,message:error.message})
  }
}

const unfollow = async(req,res) => {
    let userId = req.params.Id
    let findData = await userModel.findById(userId);
    if(!findData){
        return res.status(400).send({status:false,message:"user not found"})
    }
    if(findData.followers.includes(req.userId)){
        await userModel.findOneAndUpdate({_id:userId},{$pull:{followers:req.userId}},{new:true})
        await userModel.findOneAndUpdate({_id:req.userId},{$pull:{following:userId}},{new:true})
    }else{
        return res.status(400).send({status:false,message:`you are not following ${findData.userName}`})
    }
    return res.status(200).send({status:true, message:`Now you are not following ${findData.userName}`})
}

const getUser = async function(req,res){
    try {
        let user = await userModel.findById(req.userId)
        let registerData = {
        userName : user.userName,
        No_of_followers : user.followers.length,
        No_of_following: user.following.length
    }
    return res.status(200).send({status:true,message:"user data",data:registerData})
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
}


const getDetails = async function(req,res){
  let a = req.body.userId;
  let b = await userModel.findById(a);
  return res.send({status:true,user:b})
}

module.exports = {register,login,follow,getDetails,unfollow,getUser}