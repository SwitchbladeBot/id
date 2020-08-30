# API Endpoints

This directory is used to maintain the API endpoint files.

Every file on this directory receives a `Context` parameter, as seen on `/src/routes/README.md`, and then serves it on the `/oauth2/` route.

If a file use the router and route something on `/example`, it will be routed on the outside as `/oauth2/example`
