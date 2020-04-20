using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace RD.COVID.Traffic.App.Models
{
    public class CovidTrafficRequestData
    {
        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public string SiteId { get; set; }

        public string CountryId { get; set; }

        public string DataType { get; set; }
    }
    
}