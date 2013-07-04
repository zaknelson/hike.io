class StringUtils
	def self.is_integer?(str)
		true if Integer(str) rescue false
	end
end