const ScrapType = require("../models/scrapType.model");

exports.createScrapType = async (req, res) => {
  const {
    scrapType,
    amount,
    unit = "kg",
    minWeight = 10,
    note = "",
  } = req.body;
  try {
    const scrapTypeObj = await ScrapType.create({
      scrapType,
      amount,
      unit,
      minWeight,
      note,
    });
    res.status(201).json(scrapTypeObj);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getScrapTypes = async (req, res) => {
  try {
    const scrapTypes = await ScrapType.find();
    res.json(scrapTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
