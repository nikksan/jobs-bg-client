import request from 'request-promise';
import cheerio from 'cheerio';
import JobsBgClient, { Job } from './JobsBgClient';

class HttpJobsBgClient implements JobsBgClient {
  private baseUrl = 'https://www.jobs.bg';
  
  async fetchJobsByCompanyId(companyId: number): Promise<Array<Job>> {
    const html = await this.fetchHtml('/company/' + companyId );
    let jobs = this.extractJobs(html);

    const numPages = this.extractNumPages(html);
    if (numPages > 1) {
      for (let page = 2; page <= numPages; page++) {
        const html = await this.fetchHtml('/company/' + companyId + '?page=' + page);
        jobs = [
          ...jobs, 
          ...this.extractJobs(html),
        ];
      }
    }
    
    return jobs;
  }

  private extractJobs(html: string): Array<Job> {
    const $ = cheerio.load(html);
    
    const jobs: Array<Job> = [];
    $('.offerslistRow').each(function() {
      const $anchor = $(this).find('a').first();
      const href = $anchor.first().attr('href');
      const id = parseInt(href.split('/')[1]);
      const name = $anchor.text();
      
      const $rating = $(this).find('.iconed');
      const rating = $rating.first().text().length;
      const isHighlighted = $rating.css('color') === '#66c1ff';
      
      const dateParts = $(this).find('.explainGray').first().text().split('.');
      const day = dateParts[0];
      const month = dateParts[1];
      const year = parseInt(dateParts[2]) + 2000;
      const createdAt = new Date(`${month}.${day}.${year}`);
      
      const locationText = $(this).find('span:not([class])').first().text();
      const location = locationText.split(';')[0].trim();
      
      jobs.push({
        id,
        name,
        rating,
        location,
        createdAt,
        isHighlighted,
      });
    });
    
    return jobs;
  }

  private extractNumPages(html: string) {
    const $ = cheerio.load(html);

    return $('.pathlink').length;
  }

  private async fetchHtml(endpoint: string) {
    const url = this.baseUrl + endpoint;
    try {
      return await request(url);
    } catch (err) {
      throw new Error(`Failed to fetch ${url} [${err.statusCode}]`);
    }
  }
}

export default HttpJobsBgClient;