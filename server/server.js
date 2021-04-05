#!/usr/bin/env node

var express = require('express');
var app = express();
var fs = require('fs');

var cors = require('cors');
// use it before all route definitions
app.use(cors({origin: 'null'}));

const { Octokit } = require("@octokit/core");
//const octokit = new Octokit({auth: 'fdc0755a16ff0d836b794eba0a226f9b065b7360'});
const octokit = new Octokit();

var server = app.listen(8081, function()
{
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running at http://%s:%s", host, port);
});

app.get('/searchUsers', async function(req, res)
{
    try
    {
        const data = await octokit.request('GET /search/users',
        {
            q: 'in:login ' + req.query.user,
        }
        )

        console.log("search user login name: " + req.query.user);
        res.end(JSON.stringify(data.data.items));
    }

    catch(e)
    {
        res.status(400).end(JSON.stringify(e.message));
    }    
}
);

app.get ('/searchRepositories', async function(req, res)
{
    try
    {
        var search;
        if (req.query.user && req.query.user.length > 0)
        {
            search = "name:"+req.query.user;
            if (req.query.description && req.query.description.length > 0)
                search += "&description:"+req.query.description;
        }
        else if (req.query.description && req.query.description.length > 0)
        {
            search = "description:"+req.query.description;
        }
        
        console.log("search user repositories: " + search);
        const data = await octokit.request('GET /search/repositories',
        {
            q: search,
            per_page : 10,
            page: req.query.page,
            mediaType: {
                previews: [
                  'mercy'
                ]}
        }
        )
        res.end(JSON.stringify(data.data));
    }

    catch(e)
    {
        res.status(400).end(JSON.stringify(e.message));
    }    
}
);

