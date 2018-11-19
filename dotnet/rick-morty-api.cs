using System;
using Nancy;

namespace Parker.Holladay.Me
{
    public class IndexModule : NancyModule
    {
        public IndexModule()
        {
            var id = new Random().Next();

            Get("/", _ => GetUnknownResponse(id));
            Get("/rick", _ => GetRickResponse(id));
            Get("/morty", _ => GetMortyResponse(id));
            Get("/rick/morty", _ => GetRickAndMortyResponse(id));
        }

        Response GetUnknownResponse(int id)
        {
            var aThing = Request.Query["aThing"];
            var msg = !string.IsNullOrWhiteSpace(aThing) ? $", what is a {aThing}?" : "";
            return Response.AsJson(new { id, Dude = $"Bro{msg}" });
        }

        Response GetRickResponse(int id)
        {
            var aThing = Request.Query["aThing"];
            return Response.AsJson(new { id, Rick = WhatDoesRickSay(aThing) });
        }

        Response GetMortyResponse(int id)
        {
            var aThing = Request.Query["aThing"];
            return Response.AsJson(new { id, Morty = WhatDoesMortySay(aThing) });
        }

        Response GetRickAndMortyResponse(int id)
        {
            var aThing = Request.Query["aThing"];
            return Response.AsJson(new { id, Rick = WhatDoesRickSay(aThing), Morty = WhatDoesMortySay(aThing) });
        }

        string WhatDoesRickSay(string aThing)
        {
            var extra = !string.IsNullOrWhiteSpace(aThing) ? $" You gotta smuggle that {aThing}." : "";
            return $"You gotta... you just got to Morty.{extra}";
        }

        string WhatDoesMortySay(string aThing)
        {
            var extra = !string.IsNullOrWhiteSpace(aThing) ? $" I don't wanna smuggle a {aThing}." : "";
            return $"Mmm. I don't know Rick... {extra}";
        }
    }
}
