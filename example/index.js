var http = require("http"),

    layers = require("@nathanfaucett/layers"),
    ri = require("@nathanfaucett/ri"),

    Session = require("..");


var router = layers.Router.create(),
    server = new http.Server(function(req, res) {
        ri.init(req, res);
        router.handler(req, res);
    });


router.use(
    new Session({
        name: "test.sid"
    })
);

router.route("/sign_in")
    .get(function(req, res, next) {
        req.session.signed_in = true;
        res.redirect("/");
        next();
    });

router.route("/sign_out")
    .get(function(req, res, next) {
        req.session.signed_in = false;
        res.redirect("/");
        next();
    });

router.route("/")
    .get(function(req, res, next) {

        if (req.session.signed_in) {
            res.send('<a href="/sign_out">Sign Out</a>');
        } else {
            res.send('<a href="/sign_in">Sign In</a>');
        }

        next();
    });


server.listen(3000);
