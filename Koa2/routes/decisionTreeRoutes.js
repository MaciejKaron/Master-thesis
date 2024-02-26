const decisionTreeController = require('../controllers/decisionTreeController');

module.exports = router => {
    router.post('/api/decision-tree', decisionTreeController.performDecisionTreeClassification);
};
