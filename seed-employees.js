import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test employees...');

  try {
    // Create test employees
    const employees = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        phone: '+1-555-0101',
        department: 'Engineering',
        position: 'Senior Software Engineer',
        salary: 85000,
        role: 'EMPLOYEE'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0102',
        department: 'Marketing',
        position: 'Marketing Manager',
        salary: 72000,
        role: 'EMPLOYEE'
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@company.com',
        phone: '+1-555-0103',
        department: 'Engineering',
        position: 'Frontend Developer',
        salary: 68000,
        role: 'EMPLOYEE'
      },
      {
        firstName: 'Lisa',
        lastName: 'Williams',
        email: 'lisa.williams@company.com',
        phone: '+1-555-0104',
        department: 'HR',
        position: 'HR Specialist',
        salary: 58000,
        role: 'EMPLOYEE'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        phone: '+1-555-0105',
        department: 'Sales',
        position: 'Sales Representative',
        salary: 55000,
        role: 'EMPLOYEE'
      }
    ];

    // Hash default password
    const defaultPassword = await bcrypt.hash('employee123', 10);

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      
      // Generate employee ID
      const employeeId = `EMP${1001 + i}`;
      
      console.log(`Creating employee: ${emp.firstName} ${emp.lastName} (${employeeId})`);

      // Create User account first
      const user = await prisma.user.create({
        data: {
          email: emp.email,
          passwordHash: defaultPassword,
          role: emp.role,
          isActive: true
        }
      });

      // Create Employee record
      await prisma.employee.create({
        data: {
          employeeId,
          userId: user.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          phone: emp.phone,
          department: emp.department,
          position: emp.position,
          hireDate: new Date(),
          salary: emp.salary,
          status: 'ACTIVE'
        }
      });

      console.log(`✅ Created ${emp.firstName} ${emp.lastName}`);
    }

    console.log('\n🎉 Successfully created test employees!');
    console.log('\nTest employee credentials:');
    console.log('Email: [employee-email]@company.com');
    console.log('Password: employee123');
    console.log('\nEmployees created:');
    employees.forEach((emp, i) => {
      console.log(`- ${emp.firstName} ${emp.lastName} (EMP${1001 + i}) - ${emp.department} - ${emp.position}`);
    });

  } catch (error) {
    console.error('Error creating employees:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 