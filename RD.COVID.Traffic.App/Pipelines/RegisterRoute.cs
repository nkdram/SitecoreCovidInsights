using Sitecore.Pipelines;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace RD.COVID.Traffic.App.Pipelines
{
    /// <summary>
    /// custom route registration
    /// </summary>
    public class RegisterRoute
    {
        /// <summary>
        /// Register API route
        /// </summary>
        /// <param name="args"></param>
        public void Process(PipelineArgs args)
        {

            var config = GlobalConfiguration.Configuration;
            config.Routes.MapHttpRoute("CovidTrafficApp",
                                     "api/CovidTrafficApp/{controller}/{action}");

        }
    }
}