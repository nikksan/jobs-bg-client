type Job = {
  id: number;
  name: string;
  rating: number;
  location: string;
  createdAt: Date;
  isHighlighted: boolean;
}

interface JobsBgClient {
  fetchJobsByCompanyId(companyId: number): Promise<Array<Job>>;
}

export default JobsBgClient;
export { Job };