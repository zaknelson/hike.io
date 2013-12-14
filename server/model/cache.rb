class Cache
	

	def initialize
		@cache = {}
	end

	def set key, value
		@cache[key] = value
	end

	def get key
		@cache[key]
	end
end