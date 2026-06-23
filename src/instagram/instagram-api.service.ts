import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const IG_APP_ID = '936619743392459';
const PAGE_SIZE = 200;
const PAGE_DELAY_MS = 1000;

type IgFriendshipType = 'following' | 'followers';

@Injectable()
export class InstagramApiService {
  constructor(private readonly config: ConfigService) {}

  async getFollowing(): Promise<string[]> {
    return this.getList('following');
  }

  async getFollowers(): Promise<string[]> {
    return this.getList('followers');
  }

  private async getList(type: IgFriendshipType): Promise<string[]> {
    const userId = this.config.get<string>('IG_USER_ID');
    const sessionId = this.config.get<string>('IG_SESSION_ID');
    const csrfToken = this.config.get<string>('IG_CSRF_TOKEN');

    const usernames: string[] = [];
    let maxId: string | null = null;

    while (true) {
      const url = new URL(
        `https://www.instagram.com/api/v1/friendships/${userId}/${type}/`,
      );
      url.searchParams.set('count', String(PAGE_SIZE));
      if (maxId) {
        url.searchParams.set('max_id', maxId);
      }

      const res = await fetch(url.toString(), {
        headers: {
          'X-IG-App-ID': IG_APP_ID,
          'X-CSRFToken': csrfToken ?? '',
          'X-ASBD-ID': '129477',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${userId}`,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Referer: 'https://www.instagram.com/',
          Origin: 'https://www.instagram.com',
          Accept: '*/*',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        },
      });

      if (!res.ok) {
        throw new Error(
          `Instagram API respondió ${res.status} para ${type}: ${await res.text()}`,
        );
      }

      const data = await res.json();
      usernames.push(...data.users.map((u: { username: string }) => u.username));

      if (!data.next_max_id) {
        break;
      }
      maxId = data.next_max_id;
      await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS));
    }

    return usernames;
  }
}
