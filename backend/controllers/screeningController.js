const Screening = require('../models/Screening');
const { calculatePhq9, calculateGad7 } = require('../utils/scoreCalculators');

// Submit PHQ-9
exports.submitPhq9 = async (req, res) => {
  const { answers } = req.body;

  if (!answers || answers.length !== 9) {
    return res.status(400).json({ msg: 'Invalid PHQ-9 answers' });
  }

  try {
    const { score, riskLevel } = calculatePhq9(answers);

    const newScreening = new Screening({
      userId: req.user.id,
      testType: 'phq-9',
      answers,
      score,
      riskLevel,
    });

    const screening = await newScreening.save();
    res.json(screening);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Submit GAD-7
exports.submitGad7 = async (req, res) => {
  const { answers } = req.body;

  if (!answers || answers.length !== 7) {
    return res.status(400).json({ msg: 'Invalid GAD-7 answers' });
  }

  try {
    const { score, riskLevel } = calculateGad7(answers);

    const newScreening = new Screening({
      userId: req.user.id,
      testType: 'gad-7',
      answers,
      score,
      riskLevel,
    });

    const screening = await newScreening.save();
    res.json(screening);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
