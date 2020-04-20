using System;
using System.Collections.Generic;

using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace RD.COVID.Traffic.Core.Models
{

    /// <summary>
    /// Model to map global count info
    /// </summary>
    public partial class GlobalCovidData
    {
        [JsonProperty("count")]
        public long Count { get; set; }

        [JsonProperty("result")]
        public Dictionary<string, Result> Result { get; set; }
    }

    public partial class GlobalResult
    {
        [JsonProperty("confirmed")]
        public long Confirmed { get; set; }

        [JsonProperty("deaths")]
        public long Deaths { get; set; }

        [JsonProperty("recovered")]
        public long Recovered { get; set; }
    }
}
