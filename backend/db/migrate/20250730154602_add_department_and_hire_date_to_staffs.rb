class AddDepartmentAndHireDateToStaffs < ActiveRecord::Migration[8.0]
  def change
    add_column :staffs, :department, :string
    add_column :staffs, :hire_date, :date
  end
end
