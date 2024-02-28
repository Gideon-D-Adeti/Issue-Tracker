const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let projectId;
  let issueId;

  // Test 1: Create an issue with every field
  test("Create an issue with every field", function (done) {
    chai
      .request(server)
      .post("/api/issues/test-project")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue with every field",
        created_by: "Test User",
        assigned_to: "Assigned User",
        status_text: "In Progress",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "open");
        assert.property(res.body, "status_text");
        assert.property(res.body, "_id");
        projectId = res.body.projectId;
        issueId = res.body._id;
        done();
      });
  });

  // Test 2: Create an issue with only required fields
  test("Create an issue with only required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/test-project")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue with only required fields",
        created_by: "Test User",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "created_by");
        assert.property(res.body, "open");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 3: Create an issue with missing required fields
  test("Create an issue with missing required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/test-project")
      .send({
        issue_title: "Test Issue",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        done();
      });
  });

  // Test 4: View issues on a project
  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get("/api/issues/test-project")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test 5: View issues on a project with one filter
  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get("/api/issues/test-project?open=true")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test 6: View issues on a project with multiple filters
  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get("/api/issues/test-project?open=true&assigned_to=Assigned User")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test 7: Update one field on an issue
  test("Update one field on an issue", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-project")
      .send({
        _id: issueId,
        issue_title: "Updated Title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully updated");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 8: Update multiple fields on an issue
  test("Update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-project")
      .send({
        _id: issueId,
        issue_text: "Updated Text",
        assigned_to: "New Assignee",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully updated");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 9: Update an issue with missing _id
  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-project")
      .send({
        issue_text: "Updated Text",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  // Test 10: Update an issue with no fields to update
  test("Update an issue with no fields to update", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-project")
      .send({
        _id: issueId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "no update field(s) sent");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 11: Update an issue with an invalid _id
  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test-project")
      .send({
        _id: "invalidId",
        issue_text: "Updated Text",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not update");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 12: Delete an issue
  test("Delete an issue", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test-project")
      .send({
        _id: issueId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "result");
        assert.equal(res.body.result, "successfully deleted");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 13: Delete an issue with an invalid _id
  test("Delete an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test-project")
      .send({
        _id: "invalidId",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "could not delete");
        assert.property(res.body, "_id");
        done();
      });
  });

  // Test 14: Delete an issue with missing _id
  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test-project")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
