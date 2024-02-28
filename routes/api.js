"use strict";

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);
const { Schema } = mongoose;

const IssueSchema = new Schema({
  projectId: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: Date,
  updated_on: Date,
  created_by: { type: String, required: true },
  assigned_to: String,
  open: Boolean,
  status_text: String,
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  issues: [IssueSchema],
});

const Project = mongoose.model("Project", ProjectSchema);
const Issue = mongoose.model("Issue", IssueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(async (req, res) => {
      let projectName = req.params.project;
      try {
        const project = await Project.findOne({ name: projectName });
        if (!project) {
          res.json({ error: "project not found" });
          return;
        }
        const issues = await Issue.find({
          projectId: project._id,
          ...req.query,
        });
        res.json(issues);
      } catch (err) {
        res.json({ error: "could not get" });
      }
    })

    .post(async (req, res) => {
      let projectName = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      try {
        let projectModel = await Project.findOne({ name: projectName });
        if (!projectModel) {
          projectModel = new Project({ name: projectName });
          projectModel = await projectModel.save();
        }
        const issueModel = new Issue({
          projectId: projectModel._id,
          issue_title: issue_title || "",
          issue_text: issue_text || "",
          created_on: new Date(),
          updated_on: new Date(),
          created_by: created_by || "",
          assigned_to: assigned_to || "",
          open: true,
          status_text: status_text || "",
        });
        const issue = await issueModel.save();
        res.json(issue);
      } catch (err) {
        res.json({ error: "could not post" });
      }
    })

    .put(async (req, res) => {
      const { _id, ...updateFields } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      if (Object.keys(updateFields).length === 0) {
        res.json({ error: "no update field(s) sent", _id });
        return;
      }

      try {
        const issue = await Issue.findByIdAndUpdate(
          _id,
          { ...updateFields, updated_on: new Date() },
          { new: true }
        );
        if (!issue) {
          throw new Error("ID not found");
        }
        res.json({ result: "successfully updated", _id });
      } catch (err) {
        res.json({ error: "could not update", _id });
      }
    })

    .delete(async (req, res) => {
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      try {
        const issue = await Issue.findOneAndDelete({ _id });
        if (!issue) {
          throw new Error("ID not found");
        }
        res.json({ result: "successfully deleted", _id });
      } catch (err) {
        res.json({ error: "could not delete", _id });
      }
    });
};
