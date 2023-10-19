fn router_service(service){
    service.map_request(|request|{
        request.headers["apollographql-client-name"] = "tloz-take-this";
        request.headers["apollographql-client-version"] = "1986";
        let msg = `router request headers:
${request.headers}`;
        print(msg);
    });
    service.map_response(|response|{
        let msg = `router response headers:
${response.headers}`;
        print(msg);
    });
}

fn subgraph_service(service, subgraph){
    service.map_request(|request|{
        let msg = `${subgraph} subgraph request:
${request.subgraph.body}
${request.subgraph.headers}`;
        print(msg);
    });
    service.map_response(|response|{
        let msg = `${subgraph} subgraph response:
${response.body}
${response.headers}`;
        print(msg);
    });
}
