const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv')

dotEnv.config();

const secretKey = process.env.SECRET_KEY

const vendorRegister = async(req,res) => {
    const {username, email, password} = req.body;

    try {
        const vendorEmail = await Vendor.findOne({email});
        if(vendorEmail) {
            console.log("email already exists")
            return res.status(400).json("Email already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = new Vendor({
            username,
            email,
            password: hashedPassword
        });
        await newVendor.save();

        res.status(201).json({message: "Vendor registered successfully"});
        console.log('registered')
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"})
    }
}

const vendorLogin = async(req,res) => {
    const {email,password} = req.body;
    try {
        const vendor = await Vendor.findOne({email});
        if(!vendor || !(await bcrypt.compare(password,vendor.password))){
            return res.status(401).json({error: "Invalid user"})
        }

        const token = jwt.sign({vendorId: vendor._id}, secretKey, {expiresIn: "3h"})

        const vendorId = vendor._id;

        res.status(200).json({success: "Login Successful", token,vendorId})
        console.log(email, "this is token",token)
    } catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal server error'});
    }
}

const getAllVendors = async(req,res) => {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.json({vendors})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getVendorById = async(req,res) => {
    const vendorId = req.params.id;
    try {
        const vendor = await Vendor.findById(vendorId).populate('firm');
        if(!vendor){
            return res.status(404).json({error: "vendor not found"})
        }
        
        const vendorFirmId = vendor.firm[0]._id;

        res.status(200).json({vendor, vendorFirmId});
        console.log(vendor, vendorFirmId);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: 'Internal server error'});
    }
}

module.exports = { vendorRegister, vendorLogin, getAllVendors, getVendorById}