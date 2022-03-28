import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_ROOT = 'https://api.github.com';
const headers = new HttpHeaders().set('Authorization', 'token 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');
type Repo = {
    name: string;
};

@Injectable({
    providedIn: 'root',
})
export class GithubApiService {
    constructor(private readonly _http: HttpClient) {}

    async fetchRepos(): Promise<string[]> {
        const reposUrl = `${API_ROOT}/orgs/brightlayer-ui/repos`;
        const raw = (await firstValueFrom(this._http.get(reposUrl, { headers })).catch((err) =>
            Promise.reject(err)
        )) as Repo[];

        const repos: string[] = [];
        raw.map((repo) => repos.push(repo.name));
        return repos;
    }

    async fetchRepoMilestones(repo: string): Promise<any[]> {
        const milestonesUrl = `${API_ROOT}/repos/brightlayer-ui/${repo}/milestones?state=open`;
        const raw = (await firstValueFrom(this._http.get(milestonesUrl, { headers })).catch((err) =>
            Promise.reject(err)
        )) as any[];
        return raw;
    }
}
