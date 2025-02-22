const Search = require('../modells/Search');

const searchPostController = async(req,res)=>{
    logger.info('Search endpoint hit ...')
    try {
        
        const {query} = req.query;
        const result = Search.find(
            {
                $text: {$search : query},
            },
            {
                score: {$meta : "textScore"},
            },
        ).sort({ score : { $meta : "textScore"} }).limit(10);

        if(!result){
            res.status(401).json({
                success:false,
                message:"Can't find any content"
            });
        }

        return res.status(200).json({
            success:true,
            result,
            message:"Content Found",
        })
    } catch (error) {
        logger.error('Error while searching');
        return res.status(500).json({
            success:false,
            message:'Error while searching'
        })
    }
};

module.exports = { searchPostController };