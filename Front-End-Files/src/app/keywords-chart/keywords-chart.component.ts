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

  topKeywords :any;
  topOldKeywords :any;

  constructor(private appService : AppService,private datePipe: DatePipe) { 
    
  }
  options: NgxDateRangePickerOptions; 
  chart : any;
  oldChart : any;
  topResults : any;

  ngOnInit() {
    this.show = false;
    this.topOldKeywords = [];
    this.topKeywords = [];
    
    this.topResults = 10;

    //Get Websites
    this.appService.getWebSitesData().subscribe((Websites: any) => {      
      this.Websites = Websites.filter(ws => ws.WebSiteId != 0);
    });

    this.chart = echarts.init(document.getElementById('keywords'));
    this.oldChart = echarts.init(document.getElementById('keywords-old'));
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
    this.SelectedData = {
      from : this.postData.StartDate,
      to:this.postData.EndDate
    };
   

    this.GetKeywordsData();
  }

  public GetKeywordsData(){
    let body = new URLSearchParams();
    body.set('StartDate', this.postData.StartDate);
    body.set('EndDate', this.postData.EndDate);
    body.set('SiteId', this.postData.SiteId);
    body.set('CountryId', this.postData.CountryId);
    this.topOldKeywords = [];
    this.topKeywords = [];
    this.show = true;
    this.appService.getKeywordsdbData(body.toString()).subscribe((keywordsData: any) => {       
      var postdateStart = new Date(this.postData.StartDate); 
      var postdateEnd = new Date(this.postData.EndDate); 
      var dateDiff = (postdateEnd.getTime() - postdateStart.getTime())/(1000 * 3600 * 24);
      var startOfCovid = new Date("2020-01-22");//Start of Covid Data
      body.set('StartDate', this.datePipe.transform(startOfCovid.setDate(startOfCovid.getDate()-dateDiff), 'yyyy-MM-dd'));
      body.set('EndDate', this.datePipe.transform(new Date("2020-01-22"), 'yyyy-MM-dd'));
      this.appService.getKeywordsdbData(body.toString()).subscribe((oldKeywordsData: any) => {
        this.setChartOptions(keywordsData.Keywords, this.topResults , this.chart, 'Top Searches during selected time');
        this.setChartOptions(oldKeywordsData.Keywords, this.topResults , this.oldChart, 'Top Searches before COVID19 Crisis');
        this.topKeywords = keywordsData.TopKeywords;
        this.topOldKeywords = oldKeywordsData.TopKeywords;
        this.show = false;
      });
    });
    
  }

  private setChartOptions(data,topData,chart, text){
    var topSites = this.sortReferringSites(data);
      if(topSites.length  > topData) //TakingMaximum10 referringSites
      {
        topSites = topSites.slice(0,topData);
      }

      topSites.forEach(site => {
        if(site.children && site.children.length > topData)
          site.children = this.sortReferringSites(site.children).slice(0,topData);
    });
    this.chartDataOptions.series.data = topSites;
    this.chartDataOptions.title.text = text;
    chart.setOption(this.chartDataOptions);
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

  chartDataOptions = {
    title: {
        text: 'Top Searches during selected time',
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
        data:  {},
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

  trackByItemId(id: string, header): number { return header.id; }
  onSortChange(sortState: SortHeaderState[],data) {
    data.sort((a, b) => {
      let result = 0;
      sortState.forEach(header => {
        if (result !== 0) {
          return;
        }
        if (a[header.id] < b[header.id]) {
          if (header.direction === 'asc') {
            result = -1;
          } else if (header.direction === 'desc') {
            result = 1;
          }
        } else if (a[header.id] > b[header.id]) {
          if (header.direction === 'asc') {
            result = 1;
          } else if (header.direction === 'desc') {
            result = -1;
          }
        }
      });
      return result;
    });
  };
}
