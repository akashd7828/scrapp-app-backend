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

exports.deleteScrapType = async (req, res) => {
  try {
    // Use findById to find the scrap type by its ID
    const scrapType = await ScrapType.findById(req.params.id);

    if (!scrapType) {
      return res.status(404).json({ message: "Scrap Type not found" });
    }

    // Delete the scrap type by its ID
    await ScrapType.findByIdAndDelete(req.params.id);

    // Optionally, you can send a success response
    res.status(200).json({ message: "Scrap Type deleted successfully" });
  } catch (error) {
    console.log("@@error", error);
    res.status(500).json({ message: "Error deleting Scrap Type", error });
  }
};

exports.updateScrapType = async (req, res) => {
  const { scrapType, amount, unit, minWeight, note } = req.body;

  try {
    const scrapTypeData = await ScrapType.findById(req.params.id);

    if (!scrapTypeData) {
      return res.status(404).json({ message: "Scrap Type not found" });
    }

    // If there's a new image, delete the old one and upload the new image to Cloudinary

    // Update the other fields
    scrapTypeData.scrapType = scrapType || scrapTypeData.scrapType;
    scrapTypeData.amount = amount || scrapTypeData.amount;
    scrapTypeData.unit = unit || scrapTypeData.unit;
    scrapTypeData.minWeight = minWeight || scrapTypeData.minWeight;
    scrapTypeData.note = note || scrapTypeData.note;

    await scrapTypeData.save(); // Save the updated blog

    res
      .status(200)
      .json({ message: "scrap type updated successfully", scrapTypeData });
  } catch (error) {
    console.log("@@error", error);
    res.status(500).json({ message: "Error updating scrap type", error });
  }
};
