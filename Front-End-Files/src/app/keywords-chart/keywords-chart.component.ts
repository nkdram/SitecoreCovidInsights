import { Component, OnInit } from '@angular/core';
import { SortHeaderState } from '@speak/ng-bcl/table';
import {AppService} from '../app.service';
import { NgxDateRangePickerOptions } from 'ngx-daterangepicker';
import { DatePipe } from '@angular/common';
import * as echarts from '../../../node_modules/echarts/dist/echarts';



@Component({
  selector: 'app-keywords-chart',
  templateUrl: './keywords-chart.component.html',
  styleUrls: ['./keywords-chart.component.css'],  
  providers: [AppService,DatePipe]
})
export class KeywordsChartComponent implements OnInit {

  Websites :{};

  SelectedData: {
    from:Date,
    to:Date
  };

  postData : {
    StartDate:any,
    EndDate : any,
    CountryId:any,
    SiteId:any
  };  
  updateOptions: any;
  show: boolean;
  constructor(private appService : AppService,private datePipe: DatePipe) { 
    
  }
  options: NgxDateRangePickerOptions; 
  chart : any;

  ngOnInit() {
    this.show = false;

    //Get Websites
    this.appService.getWebSitesData().subscribe((Websites: any) => {  
      this.Websites = Websites;
      console.log(Websites);
    });

    this.chart = echarts.init(document.getElementById('keywords'));
    
    //Datepicker options
    this.options = {
        theme: 'default',
        labels: ['Start', 'End'],
        menu: [
            {alias: 'td', text: 'Today', operation: '0d'},
            {alias: 'tw', text: 'This Week', operation: '0w'},
            {alias: 'lw', text: 'Last Week', operation: '-1w'},
            {alias: 'tm', text: 'This Month', operation: '0m'},
            {alias: 'lm', text: 'Last Month', operation: '-1m'}
        ],
        dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dateFormat: 'yyyy-MM-dd',
        outputFormat: 'YYYY-MM-DD',
        startOfWeek: 0,
        outputType: 'object',
        date: {
            from: {
                year: 2020,
                month: 1,
                day: 22
            },
            to: {
                year: parseInt(this.datePipe.transform(new Date(), 'yyyy')) ,
                month:parseInt(this.datePipe.transform(new Date(), 'MM')),
                day: parseInt(this.datePipe.transform(new Date(), 'dd'))                
            }
        }
    };

    this.postData = {
      StartDate : '2020-01-22' ,//Pandemic start date -- 22nd January
      EndDate : this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      CountryId :"",
      SiteId : ""
    };
   

    this.GetKeywordsData();
  }

  public GetKeywordsData(){
    let body = new URLSearchParams();
    body.set('StartDate', this.postData.StartDate);
    body.set('EndDate', this.postData.EndDate);
    body.set('SiteId', this.postData.SiteId);
    body.set('CountryId', this.postData.CountryId);

    this.show = true;
    this.appService.getKeywordsdbData(body.toString()).subscribe((keywordsData: any) => { 
      var topSites = this.sortReferringSites(keywordsData);
      if(topSites.length  > 10) //TakingMaximum10 referringSites
      {
        topSites = topSites.slice(0,10);
      }

      topSites.forEach(site => {
        if(site.children && site.children.length > 10)
          site.children = this.sortReferringSites(site.children).slice(0,10);
      });
     
      console.log(topSites);
      let  chartDataOptions = {
        title: {
            text: 'Keywords Search during selected time',
            subtext: 'Source: ',
            textStyle: {
                fontSize: 14,
                align: 'center'
            },
            subtextStyle: {
                align: 'center'
            },
            sublink: 'https://thesitecorist.net/'
        },
        series: {
            type: 'sunburst',
            highlightPolicy: 'ancestor',
            radius: [0, '95%'],
            sort: null,
            data:  topSites,
            levels: [{},  {
              r0: '10%',
              r: '75%',
              label: {
                  align: 'right'
              }
          }, {
              r0: '75%',
              r: '72%',
              label: {
                  position: 'outside',
                  padding: 3,
                  silent: false
              },
              itemStyle: {
                  borderWidth: 3
              }
          }]
        }
      };
      this.chart.setOption(chartDataOptions);

      
      this.show = false;
    });
    
  }

  private sortReferringSites(keywordsArr){
   return keywordsArr
    .sort((c1, c2) => c2.value - c1.value)
  }

 

  submitData(){
    if(this.SelectedData.from && this.SelectedData.to){
      this.postData.StartDate = this.SelectedData.from;
      this.postData.EndDate = this.SelectedData.to;
    }

    //load Chart Data
    this.GetKeywordsData();
  }

}
