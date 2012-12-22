class Executor
	attr_accessor :logger

	def execute
		validate
		run
		output
	end

	def validate
		puts "Executor.validate, this method should be overriden"
	end

	def run
		puts "Executor.run, this method should be overriden"
	end

	def output
		puts "Executor.output, this method should be overriden"
	end
end