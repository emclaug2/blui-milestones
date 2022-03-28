import { Component } from '@angular/core';
import * as Colors from '@brightlayer-ui/colors';
import { ViewportService } from '../../services/viewport.service';
import { GithubApiService } from '../../services/github.service';

type Milestone = {
    title: string;
    repoName: string;
    description: string;
    milestoneNumber: number;
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    openedBy: string;
    dueDate: Date;
    createDate: Date;
    daysUntilLate: number;
    avatarUrl: string;
};

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    loading: boolean;
    colors = Colors;
    milestones: Milestone[] = [];

    constructor(private readonly _viewportService: ViewportService, private readonly _api: GithubApiService) {}

    ngOnInit(): void {
        this.loading = true;
        this.fetchDashboard();
    }

    /** Uses GitHub API to fetch all BLUI repos & then fetches the list of milestones in each repo. */
    fetchDashboard(): void {
        this._api
            .fetchRepos()
            .then((repos: string[]) => {
                this.fetchMilestones(repos);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /** Given a list of repos, fetches opened milestones. */
    fetchMilestones(repos: string[]): void {
        const promises = [];
        repos.map((repo: string) => {
            promises.push(this._api.fetchRepoMilestones(repo));
        });
        Promise.all(promises)
            .then((allMilestones) => {
                const rawMilestones = [];
                allMilestones.map((repoMilestones) =>
                    repoMilestones.map((openMilestones) => {
                        rawMilestones.push(openMilestones);
                    })
                );
                this.milestones = this.formatMilestones(rawMilestones);
                this.loading = false;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    formatMilestones(rawMilestones: any[]): Milestone[] {
        const milestones = [];
        console.log(rawMilestones);
        rawMilestones.map((rawMilestone) => {
            milestones.push({
                repoName: rawMilestone.url.split('/')[5],
                milestoneNumber: rawMilestone.number,
                totalIssues: Number(rawMilestone.closed_issues) + Number(rawMilestone.open_issues),
                openIssues: rawMilestone.open_issues,
                closedIssues: rawMilestone.closed_issues,
                openedBy: rawMilestone.creator.login,
                title: rawMilestone.title,
                description: rawMilestone.description?.replace('- ', ''),
                dueDate: rawMilestone.due_on ? new Date(rawMilestone.due_on) : undefined,
                avatarUrl: rawMilestone.creator.avatar_url,
                daysOverdue: rawMilestone.due_on
                    ? // @ts-ignore
                      Math.floor((new Date() - new Date(rawMilestone.due_on)) / 86400000)
                    : undefined,
            });
        });
        milestones.sort((a, b) => (a.repoName > b.repoName) ? 1 : -1)
        console.log(milestones);
        return milestones;
    }

    openMilestone(milestone: Milestone): void {
        window.open(`https://github.com/brightlayer-ui/${milestone.repoName}/milestone/${milestone.milestoneNumber}`);
    }

    isSmall(): boolean {
        return this._viewportService.isSmall();
    }
}
