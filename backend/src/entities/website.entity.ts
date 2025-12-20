import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('websites')
export class Website {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  // 添加一个虚拟属性，用于接收 name 字段的输入
  get name(): string {
    return this.title;
  }

  set name(value: string) {
    this.title = value;
  }

  @Column({ length: 500 })
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  icon: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ default: 0 })
  clicks: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}