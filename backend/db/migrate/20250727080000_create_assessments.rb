class CreateAssessments < ActiveRecord::Migration[8.0]
  def change
    create_table :assessments do |t|
      t.references :client, null: false, foreign_key: true
      t.references :staff, null: false, foreign_key: true
      t.references :support_plan, foreign_key: true
      t.string :assessment_type, null: false
      t.date :assessment_date, null: false
      t.text :summary
      t.integer :overall_score
      t.json :category_scores
      t.text :strengths
      t.text :challenges
      t.text :recommendations
      t.text :goals
      t.string :status, default: 'draft'
      t.datetime :finalized_at
      t.integer :finalized_by
      t.text :attachments
      t.text :notes

      t.timestamps
    end

    add_index :assessments, :assessment_date
    add_index :assessments, :status
    add_index :assessments, [:client_id, :assessment_date]
  end
end