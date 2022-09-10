const express = require("express")
const router = express.Router()

const userController = require("../controller/userController");
const postController = require("../controller/postController")
const commentController = require("../controller/commentController")
const authenticate = require("../middleware/auth")

router.post("/register",userController.register)
router.post("/api/authenticate",userController.login)
router.post("/api/follow/:Id",authenticate.auth, userController.follow)
router.post("/api/unfollow/:Id",authenticate.auth, userController.unfollow)
router.get("/api/user",authenticate.auth, userController.getUser)

router.post("/api/posts",authenticate.auth,postController.posts)
router.delete("/api/posts/:Id",authenticate.auth,postController.deletePost)
router.post("/api/like/:Id",authenticate.auth,postController.like)
router.post("/api/unlike/:Id",authenticate.auth,postController.unlike)
router.get("/api/posts/:Id",authenticate.auth,postController.getPostDetails)
router.get("/api/all_posts",authenticate.auth,postController.getAllPosts)

router.post("/api/comment/:Id",authenticate.auth,commentController.commentCreate)


module.exports = router