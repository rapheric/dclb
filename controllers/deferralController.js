import Deferral from "../models/Deferral.js";
import PDFDocument from "pdfkit";

/* CREATE DEFERRAL */
export const createDeferral = async (req, res) => {
  const deferral = await Deferral.create({
    ...req.body,
    deferralNumber: `DEF-${Date.now()}`,
    createdBy: req.user._id,
  });
  res.status(201).json(deferral);
};

/* GET PENDING */
export const getPendingDeferrals = async (_, res) => {
  const data = await Deferral.find({ status: "Pending" }).sort("-createdAt");
  res.json(data);
};


/* GET SINGLE */
export const getDeferral = async (req, res) => {
  const deferral = await Deferral.findById(req.params.id);
  if (!deferral) return res.status(404).json({ message: "Not found" });
  res.json(deferral);
};

/* UPDATE FACILITIES */
export const updateFacilities = async (req, res) => {
  const deferral = await Deferral.findByIdAndUpdate(
    req.params.id,
    { facilities: req.body.facilities },
    { new: true }
  );
  res.json(deferral);
};

/* ADD DOCUMENT */
export const addDocument = async (req, res) => {
  const deferral = await Deferral.findById(req.params.id);
  deferral.documents.push({
    ...req.body,
    uploadedBy: req.user._id,
  });
  await deferral.save();
  res.json(deferral);
};

/* DELETE DOCUMENT */
export const deleteDocument = async (req, res) => {
  const deferral = await Deferral.findById(req.params.id);
  deferral.documents = deferral.documents.filter(
    (d) => d._id.toString() !== req.params.docId
  );
  await deferral.save();
  res.json(deferral);
};


/* SET APPROVERS */
export const setApprovers = async (req, res) => {
  const deferral = await Deferral.findByIdAndUpdate(
    req.params.id,
    {
      approvers: req.body.approvers.map((name) => ({ name })),
      currentApproverIndex: 0,
    },
    { new: true }
  );
  res.json(deferral);
};

/* REMOVE APPROVER */
export const removeApprover = async (req, res) => {
  const deferral = await Deferral.findById(req.params.id);
  deferral.approvers.splice(req.params.index, 1);
  await deferral.save();
  res.json(deferral);
};

/* APPROVE STEP */
export const approveDeferral = async (req, res) => {
  const deferral = await Deferral.findById(req.params.id);
  const i = deferral.currentApproverIndex;

  deferral.approvers[i].approved = true;
  deferral.approvers[i].approvedAt = new Date();

  if (i + 1 < deferral.approvers.length) {
    deferral.currentApproverIndex++;
  } else {
    deferral.status = "Approved";
  }

  await deferral.save();
  res.json(deferral);
};

/* REJECT */
export const rejectDeferral = async (req, res) => {
  const deferral = await Deferral.findByIdAndUpdate(
    req.params.id,
    {
      status: "Rejected",
      rejectionReason: req.body.reason,
    },
    { new: true }
  );
  res.json(deferral);
};

/* GENERATE PDF (stub) */

// controllers/deferralController.js



export const generatePDF = async (req, res) => {
  const deferral = await Deferral.findById(req.params.id);

  if (!deferral) {
    return res.status(404).json({ message: "Deferral not found" });
  }

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${deferral.deferralNumber}.pdf`
  );

  doc.pipe(res);

  /* HEADER */
  doc.fontSize(18).text("DEFERRAL REQUEST", { align: "center" });
  doc.moveDown();

  /* BASIC INFO */
  doc.fontSize(11);
  doc.text(`Deferral No: ${deferral.deferralNumber}`);
  doc.text(`Customer No: ${deferral.customerNumber}`);
  doc.text(`Customer Name: ${deferral.customerName}`);
  doc.text(`Business Name: ${deferral.businessName}`);
  doc.text(`Loan Type: ${deferral.loanType}`);
  doc.text(`Status: ${deferral.status}`);
  doc.moveDown();

  /* FACILITIES */
  doc.fontSize(13).text("Facilities", { underline: true });
  doc.moveDown(0.5);

  deferral.facilities.forEach((f, i) => {
    doc.text(
      `${i + 1}. ${f.type} | Sanctioned: ${f.sanctioned} | Balance: ${f.balance} | Headroom: ${f.headroom}`
    );
  });

  doc.moveDown();

  /* DOCUMENTS */
  doc.fontSize(13).text("Attached Documents", { underline: true });
  doc.moveDown(0.5);

  deferral.documents.forEach((d, i) => {
    doc.text(`${i + 1}. ${d.name}`);
  });

  doc.moveDown();

  /* APPROVERS */
  doc.fontSize(13).text("Approvals", { underline: true });
  doc.moveDown(0.5);

  deferral.approvers.forEach((a, i) => {
    doc.text(
      `${i + 1}. ${a.name} - ${
        a.approved ? `Approved (${a.approvedAt?.toLocaleString()})` : "Pending"
      }`
    );
  });

  doc.end();
};
    