import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * 用户网站收藏实体
 * 用于存储用户收藏的网站
 */
@Entity('user_website_favorites')
@Index(['userId', 'websiteId'], { unique: true }) // 确保同一用户不能重复收藏同一网站
export class UserWebsiteFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'website_id' })
  websiteId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

